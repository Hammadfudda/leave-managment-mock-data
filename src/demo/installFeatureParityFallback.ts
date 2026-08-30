import type {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
} from 'axios';

const STATE_KEY =
  'nedd-demo-api-state-v1';

type Row =
  Record<string, any>;

function loadState(): Row {
  try {
    return JSON.parse(
      sessionStorage.getItem(
        STATE_KEY
      ) || '{}'
    );
  } catch {
    return {};
  }
}

function saveState(
  state: Row
) {
  sessionStorage.setItem(
    STATE_KEY,
    JSON.stringify(
      state
    )
  );
}

function normalizedPath(
  config:
    AxiosRequestConfig
) {
  const raw =
    String(
      config.url || ''
    )
      .split('?')[0];

  return raw
    .replace(
      /^https?:\/\/[^/]+\/api/,
      ''
    )
    .replace(
      /^\/api/,
      ''
    ) ||
    '/';
}

function method(
  config:
    AxiosRequestConfig
) {
  return String(
    config.method ||
    'get'
  ).toLowerCase();
}

function makeResponse(
  config:
    AxiosRequestConfig,
  data: any,
  status = 200
): AxiosResponse {
  return {
    data,
    status,
    statusText:
      status >= 200 &&
      status < 300
        ? 'OK'
        : 'Error',
    headers: {},
    config:
      config as any,
    request: {},
  };
}

function realDivision(
  value: unknown
) {
  const clean =
    String(
      value || ''
    ).trim();

  if (
    !clean ||
    [
      'admin',
      'manager',
      'employee',
    ].includes(
      clean.toLowerCase()
    )
  ) {
    return '';
  }

  return clean;
}

function upgradeState() {
  const state =
    loadState();

  if (
    !Array.isArray(
      state.users
    )
  ) {
    return;
  }

  const divisionForDepartment:
    Record<string, string> = {
      Management:
        'Corporate',
      Engineering:
        'Technology',
      Design:
        'Technology',
      Marketing:
        'Commercial',
    };

  state.roles =
    Array.isArray(
      state.roles
    )
      ? state.roles
      : [];

  const wantedDivisions = [
    'Corporate',
    'Technology',
    'Commercial',
  ];

  for (
    const name
    of wantedDivisions
  ) {
    if (
      !state.roles.some(
        (
          item: Row
        ) =>
          String(
            item.name
          )
            .toLowerCase() ===
          name.toLowerCase()
      )
    ) {
      state.roles.push({
        _id:
          `division-${name.toLowerCase()}`,
        name,
      });
    }
  }

  state.departments =
    (
      state.departments ||
      []
    ).map(
      (
        department: Row
      ) => ({
        ...department,
        divisionName:
          realDivision(
            department.divisionName
          ) ||
          divisionForDepartment[
            department.name
          ] ||
          'Corporate',
      })
    );

  state.users =
    state.users.map(
      (
        user: Row
      ) => ({
        ...user,
        roleLabel:
          realDivision(
            user.roleLabel
          ) ||
          divisionForDepartment[
            user.department
          ] ||
          'Corporate',
      })
    );

  state.organizationSettings =
    state.organizationSettings ||
    {
      leaveYearStartDay:
        1,
      leaveYearStartMonth:
        1,
      leaveYearStart:
        '01-01',
    };

  saveState(
    state
  );
}

function gradeName(
  user: Row
) {
  return (
    user.gradeId?.name ||
    user.grade ||
    ''
  );
}

function policyQuota(
  state: Row,
  grade:
    string,
  leaveType:
    string
) {
  const policy =
    (
      state.leavePolicies ||
      []
    ).find(
      (
        item: Row
      ) =>
        String(
          item.leaveType
        ).toLowerCase() ===
        leaveType.toLowerCase()
    );

  const quotaRow =
    policy?.gradeQuotas?.find(
      (
        item: Row
      ) =>
        String(
          item.gradeId?.name ||
          item.gradeName ||
          ''
        )
          .toLowerCase() ===
        grade.toLowerCase()
    );

  return Number(
    quotaRow?.yearlyQuota ||
    0
  );
}

function eligibleMonths(
  dateOfJoining:
    string,
  year:
    number
) {
  const joined =
    new Date(
      `${dateOfJoining}T00:00:00Z`
    );

  if (
    Number.isNaN(
      joined.getTime()
    ) ||
    joined.getUTCFullYear() <
      year
  ) {
    return 12;
  }

  if (
    joined.getUTCFullYear() >
    year
  ) {
    return 0;
  }

  return Math.max(
    0,
    Math.min(
      12,
      12 -
        joined.getUTCMonth()
    )
  );
}

function grantedQuota(
  state: Row,
  user: Row,
  leaveType:
    string,
  year:
    number
) {
  const yearly =
    policyQuota(
      state,
      gradeName(
        user
      ),
      leaveType
    );

  return Math.floor(
    yearly *
      eligibleMonths(
        user.dateOfJoining,
        year
      ) /
      12
  );
}

function approvedUsed(
  state: Row,
  userId:
    string,
  leaveType:
    string,
  year:
    number
) {
  return (
    state.leaveRequests ||
    []
  )
    .filter(
      (
        request: Row
      ) =>
        String(
          request.employeeId?._id ||
          request.employeeId
        ) ===
          userId &&
        request.status ===
          'approved' &&
        request.leaveType ===
          leaveType &&
        new Date(
          request.startDate
        ).getUTCFullYear() ===
          year &&
        !request.isStopRequest
    )
    .reduce(
      (
        total:
          number,
        request:
          Row
      ) =>
        total +
        Number(
          request.daysUsedBeforeCancel ??
          request.totalWorkingDays ??
          0
        ),
      0
    );
}

function balanceMap(
  state: Row,
  user: Row,
  year =
    new Date()
      .getFullYear()
) {
  return Object.fromEntries(
    [
      'annual',
      'sick',
      'casual',
    ].map(
      (
        leaveType
      ) => {
        const quota =
          grantedQuota(
            state,
            user,
            leaveType,
            year
          );

        const used =
          approvedUsed(
            state,
            user._id,
            leaveType,
            year
          );

        return [
          leaveType,
          {
            quota,
            granted:
              quota,
            used,
            remaining:
              Math.max(
                0,
                quota -
                  used
              ),
            year,
          },
        ];
      }
    )
  );
}

function yearlyRows(
  state: Row,
  year:
    number
) {
  return (
    state.users ||
    []
  )
    .filter(
      (
        user: Row
      ) =>
        user.role !==
        'admin'
    )
    .flatMap(
      (
        user: Row
      ) =>
        [
          'annual',
          'sick',
          'casual',
        ].map(
          (
            leaveType
          ) => {
            const granted =
              grantedQuota(
                state,
                user,
                leaveType,
                year
              );

            const used =
              approvedUsed(
                state,
                user._id,
                leaveType,
                year
              );

            return {
              leaveYear:
                year,
              employeeId:
                user._id,
              employeeCode:
                user.employeeId ||
                '',
              employeeName:
                user.fullName ||
                '',
              division:
                realDivision(
                  user.roleLabel
                ) ||
                (
                  state.departments ||
                  []
                ).find(
                  (
                    department:
                      Row
                  ) =>
                    department.name ===
                    user.department
                )
                  ?.divisionName ||
                '',
              department:
                user.department ||
                '',
              designation:
                user.designation ||
                '',
              grade:
                gradeName(
                  user
                ),
              leaveType,
              granted,
              used,
              remaining:
                Math.max(
                  0,
                  granted -
                    used
                ),
              employeeStatus:
                user.status ||
                '',
              detailsStatus:
                user.detailsStatus ||
                'complete',
              capturedAt:
                new Date()
                  .toISOString(),
            };
          }
        )
    );
}

async function fileFromConfig(
  config:
    AxiosRequestConfig
): Promise<File | null> {
  const data =
    config.data;

  if (
    typeof FormData ===
      'undefined' ||
    !(data instanceof
      FormData)
  ) {
    return null;
  }

  const value =
    data.get(
      'file'
    );

  return value instanceof
    File
    ? value
    : null;
}

function csvCells(
  line:
    string
) {
  const cells:
    string[] = [];

  let current =
    '';
  let quoted =
    false;

  for (
    let index = 0;
    index <
    line.length;
    index += 1
  ) {
    const char =
      line[index];

    if (
      char ===
      '"'
    ) {
      if (
        quoted &&
        line[
          index + 1
        ] ===
          '"'
      ) {
        current +=
          '"';
        index +=
          1;
      } else {
        quoted =
          !quoted;
      }
    } else if (
      char ===
        ',' &&
      !quoted
    ) {
      cells.push(
        current.trim()
      );
      current =
        '';
    } else {
      current +=
        char;
    }
  }

  cells.push(
    current.trim()
  );

  return cells;
}

async function parseCsv(
  config:
    AxiosRequestConfig
) {
  const file =
    await fileFromConfig(
      config
    );

  if (!file) {
    return [];
  }

  const text =
    await file.text();

  const lines =
    text
      .replace(
        /^\uFEFF/,
        ''
      )
      .split(
        /\r?\n/
      )
      .filter(
        (
          line
        ) =>
          line.trim()
      );

  if (
    lines.length <
    2
  ) {
    return [];
  }

  const headers =
    csvCells(
      lines[0]
    );

  return lines
    .slice(
      1
    )
    .map(
      (
        line
      ) => {
        const cells =
          csvCells(
            line
          );

        return Object.fromEntries(
          headers.map(
            (
              header,
              index
            ) => [
              header,
              cells[
                index
              ] ||
              '',
            ]
          )
        );
      }
    );
}

function normalize(
  value:
    unknown
) {
  return String(
    value || ''
  )
    .trim()
    .toLowerCase();
}

function previewFromRows(
  state: Row,
  rows:
    Row[]
) {
  const departmentSet =
    new Set(
      (
        state.departments ||
        []
      ).map(
        (
          item: Row
        ) =>
          normalize(
            item.name
          )
      )
    );

  const designationSet =
    new Set(
      (
        state.designations ||
        []
      ).map(
        (
          item: Row
        ) =>
          normalize(
            item.name
          )
      )
    );

  const gradeSet =
    new Set(
      (
        state.grades ||
        []
      ).map(
        (
          item: Row
        ) =>
          normalize(
            item.name
          )
      )
    );

  const existingEmails =
    new Set(
      (
        state.users ||
        []
      ).map(
        (
          user: Row
        ) =>
          normalize(
            user.email
          )
      )
    );

  return {
    rows:
      rows.map(
        (
          row,
          index
        ) => {
          const errors:
            string[] =
            [];

          if (
            !row.fullName
          ) {
            errors.push(
              'Full name is required.'
            );
          }

          if (
            !row.email
          ) {
            errors.push(
              'Email is required.'
            );
          }

          if (
            row.leaveYearStart &&
            row.leaveYearStart !==
              '01-01'
          ) {
            errors.push(
              `Leave Year Start "${row.leaveYearStart}" does not match 01-01.`
            );
          }

          return {
            rowNumber:
              index +
              2,
            fullName:
              row.fullName ||
              '',
            email:
              row.email ||
              '',
            employeeId:
              row.employeeId ||
              '',
            designation:
              row.designation ||
              '',
            department:
              row.department ||
              '',
            grade:
              row.grade ||
              '',
            managerReference:
              row.managerEmail ||
              row.manager ||
              '',
            sheetRole:
              row.portalRole ||
              '',
            portalAccess:
              (
                row.portalRole ||
                'employee'
              ) as
                | 'employee'
                | 'manager'
                | 'none',
            exists:
              existingEmails.has(
                normalize(
                  row.email
                )
              ),
            errors,
          };
        }
      ),
    missingDepartments:
      Array.from(
        new Set(
          rows
            .map(
              (
                row
              ) =>
                row.department
            )
            .filter(
              (
                value
              ) =>
                value &&
                !departmentSet.has(
                  normalize(
                    value
                  )
                )
            )
        )
      ),
    missingDesignations:
      Array.from(
        new Set(
          rows
            .map(
              (
                row
              ) =>
                row.designation
            )
            .filter(
              (
                value
              ) =>
                value &&
                !designationSet.has(
                  normalize(
                    value
                  )
                )
            )
        )
      ),
    missingGrades:
      Array.from(
        new Set(
          rows
            .map(
              (
                row
              ) =>
                row.grade
            )
            .filter(
              (
                value
              ) =>
                value &&
                !gradeSet.has(
                  normalize(
                    value
                  )
                )
            )
        )
      ),
    existingManagers:
      (
        state.users ||
        []
      )
        .filter(
          (
            user: Row
          ) =>
            user.role ===
            'manager'
        )
        .map(
          (
            user: Row
          ) => ({
            id:
              user._id,
            fullName:
              user.fullName,
            email:
              user.email,
            department:
              user.department,
          })
        ),
    policySuggestions:
      [],
  };
}

function metadataPreview(
  state: Row,
  rows:
    Row[]
) {
  const divisions =
    new Set(
      (
        state.roles ||
        []
      ).map(
        (
          item: Row
        ) =>
          normalize(
            item.name
          )
      )
    );

  const missingDivisions =
    Array.from(
      new Set(
        rows
          .map(
            (
              row
            ) =>
              row.division
          )
          .filter(
            (
              value
            ) =>
              value &&
              !divisions.has(
                normalize(
                  value
                )
              )
          )
      )
    );

  const errors:
    Array<{
      rowNumber:
        number;
      message:
        string;
    }> =
    [];

  const quotaMap =
    new Map<
      string,
      number
    >();

  rows.forEach(
    (
      row,
      index
    ) => {
      const rowNumber =
        index +
        2;

      if (
        !row.division
      ) {
        errors.push({
          rowNumber,
          message:
            'Division is required.',
        });
      }

      if (
        !row.leaveYearStart
      ) {
        errors.push({
          rowNumber,
          message:
            'Leave Year Start is required and must match 01-01.',
        });
      } else if (
        row.leaveYearStart !==
        '01-01'
      ) {
        errors.push({
          rowNumber,
          message:
            `Leave Year Start "${row.leaveYearStart}" does not match 01-01.`,
        });
      }

      for (
        const leaveType
        of [
          'annual',
          'sick',
          'casual',
        ]
      ) {
        const raw =
          row[
            `${leaveType}Quota`
          ];

        if (
          raw ===
            undefined ||
          raw ===
            ''
        ) {
          continue;
        }

        const quota =
          Number(
            raw
          );

        const key =
          `${normalize(
            row.grade
          )}::${leaveType}`;

        if (
          !Number.isFinite(
            quota
          ) ||
          quota <
            0
        ) {
          errors.push({
            rowNumber,
            message:
              `${leaveType}Quota must be a valid number greater than or equal to 0.`,
          });

          continue;
        }

        if (
          quotaMap.has(
            key
          ) &&
          quotaMap.get(
            key
          ) !==
            quota
        ) {
          errors.push({
            rowNumber,
            message:
              `Conflicting ${leaveType} quota for Grade ${row.grade}: ${quotaMap.get(
                key
              )} and ${quota}. A Grade can have only one yearly quota for the same leave type.`,
          });
        } else {
          quotaMap.set(
            key,
            quota
          );
        }

        const usedRaw =
          row[
            `${leaveType}Used`
          ];

        if (
          usedRaw !==
            undefined &&
          usedRaw !==
            ''
        ) {
          const used =
            Number(
              usedRaw
            );

          if (
            !Number.isFinite(
              used
            ) ||
            used <
              0
          ) {
            errors.push({
              rowNumber,
              message:
                `${leaveType}Used must be a number greater than or equal to 0.`,
            });
          }
        }
      }
    }
  );

  return {
    missingDivisions,
    missingRoles:
      missingDivisions,
    usedLeaveTypes: [
      'annual',
      'sick',
      'casual',
    ],
    errors,
  };
}

function formDecision(
  config:
    AxiosRequestConfig
) {
  const data =
    config.data;

  if (
    typeof FormData ===
      'undefined' ||
    !(data instanceof
      FormData)
  ) {
    return {};
  }

  const raw =
    data.get(
      'decisions'
    );

  if (
    typeof raw !==
    'string'
  ) {
    return {};
  }

  try {
    return JSON.parse(
      raw
    );
  } catch {
    return {};
  }
}

function upsertMaster(
  list:
    Row[],
  name:
    string,
  prefix:
    string,
  extra:
    Row = {}
) {
  const existing =
    list.find(
      (
        item
      ) =>
        normalize(
          item.name
        ) ===
        normalize(
          name
        )
    );

  if (existing) {
    return existing;
  }

  const created = {
    _id:
      `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name,
    ...extra,
  };

  list.push(
    created
  );

  return created;
}

function createImportedUsers(
  state: Row,
  rows:
    Row[],
  decisions:
    Row
) {
  const permissions =
    decisions.permissions ||
    {};

  for (
    const row
    of rows
  ) {
    if (
      (
        state.users ||
        []
      ).some(
        (
          user: Row
        ) =>
          normalize(
            user.email
          ) ===
          normalize(
            row.email
          )
      )
    ) {
      continue;
    }

    if (
      permissions.autoCreateDepartments &&
      row.department
    ) {
      upsertMaster(
        state.departments,
        row.department,
        'dept',
        {
          saturdayOff:
            true,
          divisionName:
            row.division ||
            '',
        }
      );
    }

    if (
      permissions.autoCreateDesignations &&
      row.designation
    ) {
      upsertMaster(
        state.designations,
        row.designation,
        'des'
      );
    }

    if (
      permissions.autoCreateGrades &&
      row.grade
    ) {
      upsertMaster(
        state.grades,
        row.grade,
        'grade'
      );
    }

    const grade =
      (
        state.grades ||
        []
      ).find(
        (
          item: Row
        ) =>
          normalize(
            item.name
          ) ===
          normalize(
            row.grade
          )
      ) ||
      state.grades?.[0] ||
      null;

    const manager =
      (
        state.users ||
        []
      ).find(
        (
          user: Row
        ) =>
          normalize(
            user.email
          ) ===
          normalize(
            row.managerEmail
          )
      );

    state.users.push({
      _id:
        `u-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      employeeId:
        row.employeeId,
      fullName:
        row.fullName,
      email:
        row.email,
      role:
        row.portalRole ===
          'manager'
          ? 'manager'
          : 'employee',
      roleLabel:
        row.division,
      designation:
        row.designation,
      department:
        row.department,
      gradeId:
        grade,
      dateOfJoining:
        row.dateOfJoining,
      cnic:
        row.cnic,
      phone:
        row.phone ||
        '',
      status:
        'active',
      managerId:
        permissions.applyManagerAssignments
          ? manager?._id ||
            null
          : null,
      canApproveOtherDepartments:
        normalize(
          row.canApproveOtherDepartments
        ) ===
        'true',
      detailsStatus:
        'complete',
      pendingFields:
        [],
      mustChangePassword:
        false,
      passwordChangedFromDefault:
        true,
      demoCredentialStatus:
        'Scheduled automatically',
    });
  }
}

export function installFeatureParityFallback(
  api:
    AxiosInstance
) {
  const upgrade =
    () =>
      upgradeState();

  /*
   * Layout always calls /employees/me first.
   * The normal demo adapter seeds state, then this response hook upgrades it
   * before the feature pages render.
   */
  api.interceptors.response.use(
    (
      response
    ) => {
      upgrade();

      const path =
        normalizedPath(
          response.config
        );

      const state =
        loadState();

      if (
        /^\/leave-requests\/balance\/[^/]+$/.test(
          path
        )
      ) {
        const id =
          path.split(
            '/'
          ).pop() ||
          '';

        const user =
          (
            state.users ||
            []
          ).find(
            (
              item: Row
            ) =>
              item._id ===
              id
          );

        if (user) {
          response.data = {
            success:
              true,
            data:
              balanceMap(
                state,
                user
              ),
          };
        }
      }

      return response;
    },
    async (
      error:
        AxiosError
    ) => {
      const config =
        error.config;

      if (!config) {
        return Promise.reject(
          error
        );
      }

      upgrade();

      const path =
        normalizedPath(
          config
        );

      const verb =
        method(
          config
        );

      const state =
        loadState();

      /*
       * Organization Leave Year Start.
       */
      if (
        path ===
          '/organization-settings'
      ) {
        if (
          verb ===
          'patch'
        ) {
          let body:
            Row =
            {};

          if (
            typeof config.data ===
            'string'
          ) {
            try {
              body =
                JSON.parse(
                  config.data
                );
            } catch {
              body =
                {};
            }
          } else if (
            config.data &&
            typeof config.data ===
            'object'
          ) {
            body =
              config.data as
                Row;
          }

          const day =
            Number(
              body.leaveYearStartDay ||
              1
            );

          const month =
            Number(
              body.leaveYearStartMonth ||
              1
            );

          state.organizationSettings = {
            leaveYearStartDay:
              day,
            leaveYearStartMonth:
              month,
            leaveYearStart:
              `${String(day).padStart(2, '0')}-${String(month).padStart(2, '0')}`,
          };

          saveState(
            state
          );
        }

        return makeResponse(
          config,
          {
            success:
              true,
            data:
              state.organizationSettings ||
              {
                leaveYearStartDay:
                  1,
                leaveYearStartMonth:
                  1,
                leaveYearStart:
                  '01-01',
              },
          }
        );
      }

      /*
       * Historical/current yearly report.
       */
      if (
        path ===
          '/audit-logs/yearly'
      ) {
        const queryYear =
          Number(
            (
              config.params as
              Row | undefined
            )?.year ||
            new Date()
              .getFullYear()
          );

        return makeResponse(
          config,
          {
            success:
              true,
            data:
              yearlyRows(
                state,
                queryYear
              ),
          }
        );
      }

      if (
        path ===
          '/audit-logs/yearly/export.csv'
      ) {
        const queryYear =
          Number(
            (
              config.params as
              Row | undefined
            )?.year ||
            new Date()
              .getFullYear()
          );

        const rows =
          yearlyRows(
            state,
            queryYear
          );

        const columns = [
          'leaveYear',
          'employeeCode',
          'employeeName',
          'division',
          'department',
          'designation',
          'grade',
          'leaveType',
          'granted',
          'used',
          'remaining',
        ];

        const csv = [
          columns.join(
            ','
          ),
          ...rows.map(
            (
              row:
                Row
            ) =>
              columns
                .map(
                  (
                    key
                  ) =>
                    `"${String(
                      row[
                        key
                      ] ??
                      ''
                    ).replace(
                      /"/g,
                      '""'
                    )}"`
                )
                .join(
                  ','
                )
          ),
        ].join(
          '\r\n'
        );

        return makeResponse(
          config,
          new Blob(
            [
              csv,
            ],
            {
              type:
                'text/csv;charset=utf-8;',
            }
          )
        );
      }

      /*
       * Admin finalized-decision demo actions.
       */
      const overrideMatch =
        path.match(
          /^\/leave-requests\/([^/]+)\/admin-override$/
        );

      if (
        overrideMatch &&
        verb ===
          'post'
      ) {
        let body:
          Row =
          {};

        try {
          body =
            typeof config.data ===
            'string'
              ? JSON.parse(
                  config.data
                )
              : config.data as
                Row;
        } catch {
          body =
            {};
        }

        const request =
          (
            state.leaveRequests ||
            []
          ).find(
            (
              item: Row
            ) =>
              item._id ===
              overrideMatch[
                1
              ]
          );

        if (request) {
          const previousStatus =
            request.status;

          request.status =
            body.action;

          request.approvalHistory =
            request.approvalHistory ||
            [];

          request.approvalHistory.push({
            approverId:
              'u1',
            approverName:
              'Sarah Mitchell',
            approverRole:
              'admin',
            action:
              body.action,
            comment:
              body.reason ||
              'Demo Admin override',
            actionDate:
              new Date()
                .toISOString(),
            isAdminOverride:
              true,
            previousStatus,
            newStatus:
              body.action,
          });

          saveState(
            state
          );
        }

        return makeResponse(
          config,
          {
            success:
              true,
            data:
              request,
          }
        );
      }

      const stopMatch =
        path.match(
          /^\/leave-requests\/([^/]+)\/admin-stop$/
        );

      if (
        stopMatch &&
        verb ===
          'post'
      ) {
        let body:
          Row =
          {};

        try {
          body =
            typeof config.data ===
            'string'
              ? JSON.parse(
                  config.data
                )
              : config.data as
                Row;
        } catch {
          body =
            {};
        }

        const request =
          (
            state.leaveRequests ||
            []
          ).find(
            (
              item: Row
            ) =>
              item._id ===
              stopMatch[
                1
              ]
          );

        if (request) {
          request.actualEndDate =
            body.effectiveReturnDate ||
            body.returnDate;

          request.cancelledReason =
            body.reason ||
            'Demo Admin stop';

          request.cancelledBy =
            'u1';

          request.cancelledByName =
            'Sarah Mitchell';

          request.daysUsedBeforeCancel =
            Math.max(
              0,
              Math.min(
                Number(
                  request.totalWorkingDays ||
                  0
                ),
                1
              )
            );

          request.approvalHistory =
            request.approvalHistory ||
            [];

          request.approvalHistory.push({
            approverId:
              'u1',
            approverName:
              'Sarah Mitchell',
            approverRole:
              'admin',
            action:
              'approved',
            comment:
              body.reason ||
              'Demo Admin stop',
            actionDate:
              new Date()
                .toISOString(),
            isAdminStop:
              true,
            effectiveReturnDate:
              request.actualEndDate,
          });

          saveState(
            state
          );
        }

        return makeResponse(
          config,
          {
            success:
              true,
            data:
              request,
          }
        );
      }

      /*
       * Employee Division compatibility endpoint.
       */
      const roleLabelMatch =
        path.match(
          /^\/employees\/([^/]+)\/role-label$/
        );

      if (
        roleLabelMatch &&
        verb ===
          'patch'
      ) {
        let body:
          Row =
          {};

        try {
          body =
            typeof config.data ===
            'string'
              ? JSON.parse(
                  config.data
                )
              : config.data as
                Row;
        } catch {
          body =
            {};
        }

        const user =
          (
            state.users ||
            []
          ).find(
            (
              item: Row
            ) =>
              item._id ===
              roleLabelMatch[
                1
              ]
          );

        if (user) {
          user.roleLabel =
            body.roleLabel ||
            body.division ||
            '';

          saveState(
            state
          );
        }

        return makeResponse(
          config,
          {
            success:
              true,
            data:
              user,
          }
        );
      }

      /*
       * Smart CSV demo.
       * This is deliberately simulated in sessionStorage only.
       */
      if (
        path ===
          '/employees/import-smart/preview' &&
        verb ===
          'post'
      ) {
        const rows =
          await parseCsv(
            config
          );

        return makeResponse(
          config,
          {
            success:
              true,
            preview:
              previewFromRows(
                state,
                rows
              ),
          }
        );
      }

      if (
        path ===
          '/employees/import-smart/metadata-preview' &&
        verb ===
          'post'
      ) {
        const rows =
          await parseCsv(
            config
          );

        return makeResponse(
          config,
          {
            success:
              true,
            preview:
              metadataPreview(
                state,
                rows
              ),
          }
        );
      }

      if (
        path ===
          '/employees/import-smart/commit' &&
        verb ===
          'post'
      ) {
        const rows =
          await parseCsv(
            config
          );

        const decisions =
          formDecision(
            config
          );

        const meta =
          metadataPreview(
            state,
            rows
          );

        if (
          meta.errors.length
        ) {
          return Promise.reject(
            Object.assign(
              new Error(
                [
                  'CSV validation failed.',
                  ...meta.errors.map(
                    (
                      item
                    ) =>
                      `Row ${item.rowNumber}: ${item.message}`
                  ),
                ].join(
                  '\n'
                )
              ),
              {
                response: {
                  status:
                    400,
                  data: {
                    message:
                      [
                        'CSV validation failed.',
                        ...meta.errors.map(
                          (
                            item
                          ) =>
                            `Row ${item.rowNumber}: ${item.message}`
                        ),
                      ].join(
                        '\n'
                      ),
                  },
                },
                config,
              }
            )
          );
        }

        createImportedUsers(
          state,
          rows,
          decisions
        );

        saveState(
          state
        );

        return makeResponse(
          config,
          {
            success:
              true,
            data: {
              created:
                rows.length,
              credentials:
                'Scheduled automatically',
            },
          }
        );
      }

      if (
        path ===
          '/employees/import-smart/metadata-commit' &&
        verb ===
          'post'
      ) {
        const rows =
          await parseCsv(
            config
          );

        const decisions =
          formDecision(
            config
          );

        if (
          decisions.autoCreateDivisions
        ) {
          for (
            const row
            of rows
          ) {
            if (
              row.division
            ) {
              upsertMaster(
                state.roles,
                row.division,
                'division'
              );
            }

            const department =
              (
                state.departments ||
                []
              ).find(
                (
                  item: Row
                ) =>
                  normalize(
                    item.name
                  ) ===
                  normalize(
                    row.department
                  )
              );

            if (
              department &&
              !department.divisionName
            ) {
              department.divisionName =
                row.division;
            }
          }
        }

        saveState(
          state
        );

        return makeResponse(
          config,
          {
            success:
              true,
            data: {
              employeesUpdated:
                rows.length,
              balancesUpdated:
                rows.length *
                3,
            },
          }
        );
      }

      if (
        path ===
          '/employees/import-smart/retry-emails' &&
        verb ===
          'post'
      ) {
        return makeResponse(
          config,
          {
            success:
              true,
            data: {
              scheduled:
                0,
              message:
                'Demo credentials are simulated automatically.',
            },
          }
        );
      }

      return Promise.reject(
        error
      );
    }
  );
}
